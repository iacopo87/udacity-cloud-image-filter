pipeline {
    agent any
    environment {
        CI = 'true'
    }
    stages {
        stage('Build') {
             steps {
                 sh 'npm ci'
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
                branch 'development' 
            }
            steps {
                sh 'deliver for dev'
            }
        }
        stage('Deploy for production') {
            when {
                branch 'production'  
            }
            steps {
                 sh 'deliver for prod'
            }
        }
    }
    post {
      always {
        cleanWs();
      }
  }
}
