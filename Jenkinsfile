#!/usr/bin/env groovy

pipeline {
  agent any

  options {
    ansiColor('xterm')
    timestamps()
  }

  libraries {
    lib("pay-jenkins-library@PP-3527-fix-smoke-test-calls")
  }

  stages {
    stage('Smoke Tests') {
      steps {
        runDirectDebitSmokeTest()
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
