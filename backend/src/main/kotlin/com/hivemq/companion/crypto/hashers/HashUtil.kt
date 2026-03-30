package com.hivemq.companion.crypto.hashers

import org.bouncycastle.crypto.Digest

object HashUtil {

    fun hash(digestFactory: () -> Digest, hashSize: Int, value: ByteArray): ByteArray {
        val digest = digestFactory()
        digest.update(value, 0, value.size)
        val out = ByteArray(hashSize)
        digest.doFinal(out, 0)
        return out
    }

    fun hash(digestFactory: () -> Digest, hashSize: Int, salt: ByteArray, secret: ByteArray, iterations: Int): ByteArray {
        val digest = digestFactory()
        digest.update(salt, 0, salt.size)
        digest.update(secret, 0, secret.size)

        val hash = ByteArray(hashSize)
        digest.doFinal(hash, 0)

        for (i in 1 until iterations) {
            digest.update(hash, 0, hash.size)
            digest.doFinal(hash, 0)
        }

        return hash
    }
}
