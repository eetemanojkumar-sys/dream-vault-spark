pipeline {
    agent any

    environment {
        PATH = "/usr/bin:/usr/local/bin:${env.PATH}"
        IMAGE_NAME = "manoj0326/dream-vault"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/eetemanojkumar-sys/dream-vault-spark.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build React App') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    '''
                }
            }
        }
      
       stage('Push Docker Image') {
    steps {
        sh """
            docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest

            docker push ${IMAGE_NAME}:${IMAGE_TAG}

            docker push ${IMAGE_NAME}:latest
        """
    }
}

     stage('Deploy to Kubernetes') {
       steps {
        sh '''
        export KUBECONFIG=/var/lib/jenkins/.kube/config

        kubectl set image deployment/dream-vault \
        dream-vault=manoj0326/dream-vault:latest

        kubectl rollout status deployment/dream-vault
        '''
    }
}

        stage('Deploy Container') {
            steps {
                sh """
                    docker stop dream-vault || true
                    docker rm dream-vault || true

                    docker run -d \
                    --name dream-vault \
                    -p 80:80 \
                    ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }
    }
}
