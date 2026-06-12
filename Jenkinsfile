pipeline {
    agent any

    parameters {
        booleanParam(name: 'RUN_ANSIBLE', defaultValue: false, description: 'Run Ansible Provisioning Playbook')
    }

    environment {
        EC2_USER = 'ubuntu'
        EC2_HOST = '3.109.162.148'   
        APP_DIR  = '/home/ubuntu/Mahalaxmi-Tailoring'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/ayushdayal900/Mahalaxmi-Tailoring.git'
            }
        }

        stage('Lint & Test (Backend)') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test --if-present'
                }
            }
        }

        stage('Lint & Test (Frontend)') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy Backend to EC2') {
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} "
                            cd ${APP_DIR} && \
                            git fetch origin && \
                            git reset --hard origin/main && \
                            cd backend && \
                            npm install --production && \
                            pm2 reload mahalaxmi-backend --update-env
                        "
                    '''
                }
            }
        }

        stage('Run Ansible Provisioning (Optional)') {
            when {
                // Only run Ansible if triggered manually or on infra changes
                expression { params.RUN_ANSIBLE == true }
            }
            steps {
                ansiblePlaybook(
                    playbook: 'ansible/playbook.yml',
                    inventory: 'ansible/inventory.ini',
                    credentialsId: 'ec2-ssh-key',
                    extras: '-e "env=production"'
                )
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed! Check the logs above.'
            // Optional: Send email notification
            // mail to: 'support@mahalaxmi-tailors.shop',
            //      subject: "Jenkins Build Failed: ${env.JOB_NAME}",
            //      body: "Build ${env.BUILD_NUMBER} failed. Check: ${env.BUILD_URL}"
        }
    }
}