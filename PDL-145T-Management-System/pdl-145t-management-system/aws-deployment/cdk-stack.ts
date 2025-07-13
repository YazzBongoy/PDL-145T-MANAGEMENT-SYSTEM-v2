import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export class PDL145TManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'PDL145T-VPC', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // RDS Database (PostgreSQL with PostGIS)
    const dbSecret = new secretsmanager.Secret(this, 'PDL145T-DB-Secret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'pdl_admin' }),
        generateStringKey: 'password',
        excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
      },
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'PDL145T-DB-SG', {
      vpc,
      description: 'Security group for RDS database',
    });

    const database = new rds.DatabaseInstance(this, 'PDL145T-Database', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_4,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      credentials: rds.Credentials.fromSecret(dbSecret),
      databaseName: 'pdl_management',
      storageEncrypted: true,
      multiAz: false,
      securityGroups: [dbSecurityGroup],
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'PDL145T-Cluster', {
      vpc,
      containerInsights: true,
    });

    // ECR Repositories
    const backendRepo = new ecr.Repository(this, 'PDL145T-Backend-Repo', {
      repositoryName: 'pdl-backend',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const frontendRepo = new ecr.Repository(this, 'PDL145T-Frontend-Repo', {
      repositoryName: 'pdl-frontend',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // JWT Secret
    const jwtSecret = new secretsmanager.Secret(this, 'PDL145T-JWT-Secret', {
      generateSecretString: {
        length: 32,
        excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
      },
    });

    // Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'PDL145T-TaskDef', {
      memoryLimitMiB: 2048,
      cpu: 1024,
    });

    // Backend Container
    const backendContainer = taskDefinition.addContainer('backend', {
      image: ecs.ContainerImage.fromEcrRepository(backendRepo, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'backend',
        logGroup: new logs.LogGroup(this, 'PDL145T-Backend-LogGroup', {
          logGroupName: '/ecs/pdl-145t-backend',
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      }),
      environment: {
        NODE_ENV: 'production',
        PORT: '3010',
      },
      secrets: {
        DATABASE_URL: ecs.Secret.fromSecretsManager(dbSecret, 'engine'),
        JWT_SECRET: ecs.Secret.fromSecretsManager(jwtSecret),
      },
    });

    backendContainer.addPortMappings({
      containerPort: 3010,
      protocol: ecs.Protocol.TCP,
    });

    // Frontend Container
    const frontendContainer = taskDefinition.addContainer('frontend', {
      image: ecs.ContainerImage.fromEcrRepository(frontendRepo, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'frontend',
        logGroup: new logs.LogGroup(this, 'PDL145T-Frontend-LogGroup', {
          logGroupName: '/ecs/pdl-145t-frontend',
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      }),
      environment: {
        VITE_API_URL: 'https://api.yourdomain.com',
      },
    });

    frontendContainer.addPortMappings({
      containerPort: 80,
      protocol: ecs.Protocol.TCP,
    });

    // ECS Service
    const service = new ecs.FargateService(this, 'PDL145T-Service', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: true,
    });

    // Allow ECS to connect to RDS
    dbSecurityGroup.addIngressRule(
      service.connections.securityGroups[0],
      ec2.Port.tcp(5432),
      'Allow ECS to connect to RDS'
    );

    // Application Load Balancer
    const loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'PDL145T-ALB', {
      vpc,
      internetFacing: true,
    });

    // Target Groups
    const backendTargetGroup = new elbv2.ApplicationTargetGroup(this, 'PDL145T-Backend-TG', {
      port: 3010,
      protocol: elbv2.ApplicationProtocol.HTTP,
      vpc,
      targets: [service.loadBalancerTarget({
        containerName: 'backend',
        containerPort: 3010,
      })],
      healthCheck: {
        enabled: true,
        path: '/health',
        protocol: elbv2.Protocol.HTTP,
      },
    });

    const frontendTargetGroup = new elbv2.ApplicationTargetGroup(this, 'PDL145T-Frontend-TG', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      vpc,
      targets: [service.loadBalancerTarget({
        containerName: 'frontend',
        containerPort: 80,
      })],
      healthCheck: {
        enabled: true,
        path: '/',
        protocol: elbv2.Protocol.HTTP,
      },
    });

    // Listeners
    const listener = loadBalancer.addListener('PDL145T-Listener', {
      port: 80,
      defaultAction: elbv2.ListenerAction.forward([frontendTargetGroup]),
    });

    listener.addAction('API', {
      action: elbv2.ListenerAction.forward([backendTargetGroup]),
      conditions: [elbv2.ListenerCondition.pathPatterns(['/api/*'])],
      priority: 1,
    });

    // Output values
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: loadBalancer.loadBalancerDnsName,
      description: 'DNS name of the load balancer',
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.instanceEndpoint.hostname,
      description: 'RDS database endpoint',
    });

    new cdk.CfnOutput(this, 'BackendRepoUri', {
      value: backendRepo.repositoryUri,
      description: 'Backend ECR repository URI',
    });

    new cdk.CfnOutput(this, 'FrontendRepoUri', {
      value: frontendRepo.repositoryUri,
      description: 'Frontend ECR repository URI',
    });
  }
}

// CDK App
const app = new cdk.App();
new PDL145TManagementStack(app, 'PDL145TManagementStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
