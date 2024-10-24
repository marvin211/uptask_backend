pipeline {
    agent any
    tools {
        nodejs 'node16'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Docker Build and Push') {
            steps {
                script {
                    docker.withRegistry('https://your-docker-registry', 'docker-credentials-id') {
                        def app = docker.build("your-docker-registry/express-api:${env.BUILD_NUMBER}")
                        app.push()
                        app.push('latest')
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    withKubeConfig([credentialsId: 'kubernetes-credentials-id', serverUrl: 'https://your-kubernetes-api-server']) {
                        sh "kubectl apply -f DeployDB.yaml"
                        sh "kubectl apply -f DeploymentService.yaml"
                        sh "kubectl set image deployment/express-api-deployment express-api=your-docker-registry/express-api:${env.BUILD_NUMBER}"
                    }
                }
            }
        }
    }
}
