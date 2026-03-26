package com.hivemq.companion.crypto.hashers

import org.bouncycastle.crypto.digests.MD5Digest

object Md5Hasher {

    private const val HASH_SIZE = 16

    fun hash(salt: ByteArray, secret: ByteArray, iterations: Int): ByteArray {
        return HashUtil.hash(::MD5Digest, HASH_SIZE, salt, secret, iterations)
    }
}
