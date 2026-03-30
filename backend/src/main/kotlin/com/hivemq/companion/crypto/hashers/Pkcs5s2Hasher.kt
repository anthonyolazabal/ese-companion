package com.hivemq.companion.crypto.hashers

import org.bouncycastle.crypto.digests.SHA512Digest
import org.bouncycastle.crypto.generators.PKCS5S2ParametersGenerator
import org.bouncycastle.crypto.params.KeyParameter

object Pkcs5s2Hasher {

    private const val KEY_SIZE_IN_BITS = 32 * 8

    fun hash(salt: ByteArray, secret: ByteArray, iterations: Int): ByteArray {
        val generator = PKCS5S2ParametersGenerator(SHA512Digest())
        generator.init(secret, salt, iterations)
        return (generator.generateDerivedParameters(KEY_SIZE_IN_BITS) as KeyParameter).key
    }
}
