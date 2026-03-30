package com.hivemq.companion.crypto.hashers

import org.bouncycastle.crypto.digests.MD5Digest
import org.bouncycastle.crypto.digests.SHA512Digest
import org.bouncycastle.crypto.generators.BCrypt

object BCryptHasher {

    private const val HASHED_SALT_SIZE = 16
    private const val HASHED_SECRET_SIZE = 64

    fun hash(salt: ByteArray, secret: ByteArray, cost: Int): ByteArray {
        val hashedSalt = HashUtil.hash(::MD5Digest, HASHED_SALT_SIZE, salt)
        val hashedSecret = HashUtil.hash(::SHA512Digest, HASHED_SECRET_SIZE, secret)
        return BCrypt.generate(hashedSecret, hashedSalt, cost)
    }
}
