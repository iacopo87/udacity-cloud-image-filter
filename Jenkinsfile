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
            stages {
                stage('Create Network Infrastacture and Cluster') {
                    steps {
                        withAWS(region:'eu-west-2', credentials:'jenkins') {
                            script {
                                sh 'cd automation/ansible && ansible-playbook main.yml && cd ../..'
                            }
                        }
                    }
                }
                stage('Deployment') {
                    steps {
                        withAWS(region:'eu-west-2', credentials:'jenkins') {
                            script {
                                sh 'cd automation/ansible && ansible-playbook deploy.yml --tags "deployment" && cd ../..'
                            }
                        }
                    }
                }
                stage("User input confirm switch") {
                    steps {
                        input(message: "Do you want to switch to the newly deployed version?")
                    }
                }
                stage('Redirect traffic to new cluster') {
                    steps {
                        withAWS(region:'eu-west-2', credentials:'jenkins') {
                            script {
                                sh 'cd automation/ansible && ansible-playbook deploy.yml --tags "service" && cd ../..'
                            }
                        }
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
