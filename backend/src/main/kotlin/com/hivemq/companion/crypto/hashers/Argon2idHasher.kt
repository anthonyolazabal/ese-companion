package com.hivemq.companion.crypto.hashers

import org.bouncycastle.crypto.generators.Argon2BytesGenerator
import org.bouncycastle.crypto.params.Argon2Parameters

object Argon2idHasher {

    private const val HASH_SIZE = 32

    fun hash(salt: ByteArray, secret: ByteArray, iterations: Int, memoryAsKb: Int): ByteArray {
        val parameters = Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
            .withParallelism(1)
            .withSalt(salt)
            .withIterations(iterations)
            .withMemoryAsKB(memoryAsKb)
            .build()

        val generator = Argon2BytesGenerator()
        generator.init(parameters)

        val out = ByteArray(HASH_SIZE)
        generator.generateBytes(secret, out)
        return out
    }
}
