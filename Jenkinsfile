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
          postMetric("directdebit-frontend.docker-build.failure", 1, "new")
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
          postMetric("directdebit-frontend.docker-tag.failure", 1, "new")
        }
      }
    }
    stage('Deploy') {
      when {
        branch 'master'
      }
      steps {
        deployEcs("directdebit-frontend", "test", null, true, true, "uk.gov.pay.endtoend.categories.SmokeDirectDebitPayments", false)
      }
    }
  }
  post {
    failure {
      postMetric("directdebit-frontend.failure", 1, "new")
    }
    success {
      postSuccessfulMetrics("directdebit-frontend")
    }
  }
}
