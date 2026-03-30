package com.hivemq.companion.plugins

import com.hivemq.companion.config.ServerConfig
import io.ktor.network.tls.certificates.*
import java.io.File
import java.security.KeyStore

/**
 * Configures and returns a KeyStore for HTTPS.
 *
 * If [ServerConfig.httpsJksPath] is set, loads the keystore from that file.
 * Otherwise, generates a self-signed certificate in memory (regenerated on each restart).
 */
fun buildKeyStore(serverConfig: ServerConfig): KeyStore {
    val jksPath = serverConfig.httpsJksPath
    return if (!jksPath.isNullOrBlank()) {
        val password = serverConfig.httpsPassword ?: ""
        val file = File(jksPath)
        require(file.exists()) { "JKS keystore file not found: $jksPath" }
        KeyStore.getInstance("JKS").apply {
            file.inputStream().use { load(it, password.toCharArray()) }
        }
    } else {
        buildKeyStore {
            certificate("ese-companion") {
                password = "changeit"
                domains = listOf("localhost", "0.0.0.0", "127.0.0.1")
            }
        }
    }
}

/**
 * Returns the keystore password for the configured or auto-generated keystore.
 */
fun keyStorePassword(serverConfig: ServerConfig): String =
    if (!serverConfig.httpsJksPath.isNullOrBlank()) {
        serverConfig.httpsPassword ?: ""
    } else {
        "changeit"
    }

/**
 * Returns the private key password for the configured or auto-generated keystore.
 */
fun privateKeyPassword(serverConfig: ServerConfig): String =
    if (!serverConfig.httpsJksPath.isNullOrBlank()) {
        serverConfig.httpsPkPassword ?: serverConfig.httpsPassword ?: ""
    } else {
        "changeit"
    }
