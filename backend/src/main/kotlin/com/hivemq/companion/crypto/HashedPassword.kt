package com.hivemq.companion.crypto

data class HashedPassword(
    val hash: String,
    val salt: String,
    val algorithm: String,
    val iterations: Int
)
