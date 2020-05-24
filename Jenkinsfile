pipeline {
    agent any
    environment {
        CI = 'true'
    }
    stages {
        stage('Build') {
             steps {
                 sh 'npm i'
             }
        }
        stage('Lint Typescript') {
              steps {
                  sh 'npm run lint'
              }
        }
        stage('Build Docker image') {
            steps {
                echo 'Building Container..'
                script {
                    app = docker.build("iacopoiacopo/cloudimagefilter", "-f Dockerfile .")
                }
            }
        }
        stage('Push image') {            
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                        app.push("${env.BUILD_NUMBER}")
                        app.push("latest")
                    }
                }
            }
        }
        stage('Deliver for development') {
            when {
                branch 'dev' 
            }
            steps {
                sh 'deliver for dev'
            }
        }
        stage('Deploy for production') {
            stage('AWS Credentials') {            
                steps {
                    withCredentials([[
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws',
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                    ]])            
                    sh """
                        mkdir -p ~/.aws
                        echo "[default]" >~/.aws/credentials
                        echo "[default]" >~/.boto
                        echo "aws_access_key_id = ${AWS_ACCESS_KEY_ID}" >> ~/.boto
                        echo "aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}" >> ~/.boto
                        echo "aws_access_key_id = ${AWS_ACCESS_KEY_ID}" >> ~/.aws/credentials
                        echo "aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}" >> ~/.aws/credentials
                    """
                    }
            }
            stage('Create Network Infrastacture and Cluster') {
                steps {
                    script {
                        sh 'cd automation/ansible && ansible-playbook ./automation/ansible/main.yml && cd ../..'
                    }
                }
            }
            stage('Deployment') {
                steps {
                    script {
                        sh 'cd automation/ansible && ansible-playbook ./automation/ansible/deploy.yml --tags "deployment" && cd ../..'
                    }
                }
            }
            stage("User input confirm switch"){
                input "Do you want to switch to the newly deployed version?"
            }
            stage('Redirect traffic to new cluster') {
                steps {
                    script {
                        sh 'cd automation/ansible && ansible-playbook ./automation/ansible/deploy.yml --tags "service" && cd ../..'
                    }
                }
            }
        }
    }
    post {
      always {
        cleanWs();
      }
  }
}
