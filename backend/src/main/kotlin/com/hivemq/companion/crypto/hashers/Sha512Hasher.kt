package com.hivemq.companion.crypto.hashers

import org.bouncycastle.crypto.digests.SHA512Digest

object Sha512Hasher {

    private const val HASH_SIZE = 64

    fun hash(salt: ByteArray, secret: ByteArray, iterations: Int): ByteArray {
        return HashUtil.hash(::SHA512Digest, HASH_SIZE, salt, secret, iterations)
    }
}
