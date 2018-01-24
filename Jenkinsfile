#!/usr/bin/env groovy

pipeline {
  agent any

  options {
    ansiColor('xterm')
    timestamps()
  }

  libraries {
    lib("pay-jenkins-library@master")
  }

  stages {
    stage('Docker Build') {
      steps {
        script {
          buildApp{
            app = "directdebit-frontend"
          }
        }
      }
    }
    stage('Test') {
      steps {
        runParameterisedEndToEnd("directdebitfrontend", null, "end2end-tagged", false, false, "uk.gov.pay.endtoend.categories.End2EndDirectDebit", "", "run-end-to-end-direct-debit-tests")
      }
    }
    stage('Docker Tag') {
      steps {
        script {
          dockerTag {
            app = "directdebit-frontend"
          }
        }
      }
    }
    stage('Deploy') {
      when {
        branch 'master'
      }
      steps {
        deployEcs("directdebit-frontend", "test", null, true, true)
      }
    }
  }
}
