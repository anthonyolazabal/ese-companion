plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ktor)
    alias(libs.plugins.shadow)
}

group = "com.hivemq"
version = "2.0.0"

application {
    mainClass.set("com.hivemq.companion.ApplicationKt")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.auth)
    implementation(libs.ktor.server.auth.jwt)
    implementation(libs.ktor.server.cors)
    implementation(libs.ktor.server.status.pages)
    implementation(libs.ktor.server.rate.limit)
    implementation(libs.ktor.server.call.logging)
    implementation(libs.ktor.server.default.headers)
    implementation(libs.ktor.server.tls)
    implementation(libs.exposed.core)
    implementation(libs.exposed.dao)
    implementation(libs.exposed.jdbc)
    implementation(libs.exposed.json)
    implementation(libs.exposed.kotlin.datetime)
    implementation(libs.hikari)
    implementation(libs.bouncycastle)
    implementation(libs.logback)
    implementation(libs.kompendium.core)
    implementation(libs.postgresql)
    implementation(libs.mysql)
    implementation(libs.mssql)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.datetime)
    implementation(libs.jbcrypt)

    testImplementation(libs.ktor.server.test)
    testImplementation(libs.kotlin.test)
    testImplementation("com.h2database:h2:2.3.232")
    testImplementation("io.ktor:ktor-client-content-negotiation:${libs.versions.ktor.get()}")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.9.0")
}

kotlin {
    jvmToolchain(21)
}
