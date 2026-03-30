package com.hivemq.companion.crypto.hashers

object PlainHasher {
    fun hash(secret: ByteArray): ByteArray = secret
}
