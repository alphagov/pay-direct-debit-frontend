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
          buildAppWithMetrics {
            app = "directdebit-frontend"
          }
        }
      }
      post {
        failure {
          postMetric("directdebit-frontend.docker-build.failure", 1)
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
          dockerTagWithMetrics {
            app = "directdebit-frontend"
          }
        }
      }
      post {
        failure {
          postMetric("directdebit-frontend.docker-tag.failure", 1)
        }
      }
    }
    stage('Deploy') {
      when {
        branch 'master'
      }
      steps {
        deployEcs("directdebit-frontend", "test", null, false, false, "dummy", false)
      }
    }
    stage('Smoke Tests') {
      when {
        branch 'master'
      }
      steps {
        runDirectDebitSmokeTest()
      }
    }
    stage('Complete') {
      failFast true
      parallel {
        stage('Tag Build') {
          when {
            branch 'master'
          }
          steps {
            tagDeployment("direct-debit-frontend")
          }
        }
        stage('Trigger Deploy Notification') {
          when {
            branch 'master'
          }
          steps {
            // until we fix the repo name to match the microservice
            triggerGraphiteDeployEvent("direct-debit-frontend")
          }
        }
      }
    }
  }
  post {
    failure {
      postMetric(appendBranchSuffix("directdebit-frontend") + ".failure", 1)
    }
    success {
      postSuccessfulMetrics(appendBranchSuffix("directdebit-frontend"))
    }
  }
}
