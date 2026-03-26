package com.hivemq.companion.crypto

import com.hivemq.companion.crypto.hashers.*
import org.bouncycastle.util.encoders.Base64
import java.nio.charset.StandardCharsets
import java.security.SecureRandom

class CryptoService {

    private val secureRandom = SecureRandom()

    fun generateSalt(): ByteArray {
        val salt = ByteArray(16)
        secureRandom.nextBytes(salt)
        return salt
    }

    fun hashPassword(
        password: String,
        algorithm: String,
        iterations: Int,
        salt: ByteArray? = null
    ): HashedPassword {
        val passwordBytes = password.toByteArray(StandardCharsets.UTF_8)

        if (algorithm == "PLAIN") {
            return HashedPassword(
                hash = Base64.toBase64String(PlainHasher.hash(passwordBytes)),
                salt = "",
                algorithm = algorithm,
                iterations = 0
            )
        }

        val effectiveSalt = salt ?: generateSalt()
        val hashBytes = computeHash(passwordBytes, algorithm, iterations, effectiveSalt)

        return HashedPassword(
            hash = Base64.toBase64String(hashBytes),
            salt = Base64.toBase64String(effectiveSalt),
            algorithm = algorithm,
            iterations = iterations
        )
    }

    fun verifyPassword(
        password: String,
        storedHash: String,
        salt: String,
        algorithm: String,
        iterations: Int
    ): Boolean {
        val passwordBytes = password.toByteArray(StandardCharsets.UTF_8)

        if (algorithm == "PLAIN") {
            val computed = PlainHasher.hash(passwordBytes)
            return Base64.toBase64String(computed) == storedHash
        }

        val saltBytes = Base64.decode(salt)
        val computedHash = computeHash(passwordBytes, algorithm, iterations, saltBytes)
        val computedBase64 = Base64.toBase64String(computedHash)
        return computedBase64 == storedHash
    }

    private fun computeHash(
        passwordBytes: ByteArray,
        algorithm: String,
        iterations: Int,
        salt: ByteArray
    ): ByteArray {
        return when {
            algorithm == "MD5" -> Md5Hasher.hash(salt, passwordBytes, iterations)
            algorithm == "SHA512" -> Sha512Hasher.hash(salt, passwordBytes, iterations)
            algorithm == "PKCS5S2" -> Pkcs5s2Hasher.hash(salt, passwordBytes, iterations)
            algorithm == "BCRYPT" -> BCryptHasher.hash(salt, passwordBytes, iterations)
            algorithm.startsWith("ARGON2ID_") && algorithm.endsWith("KB") -> {
                val memoryPart = algorithm.removePrefix("ARGON2ID_").removeSuffix("KB")
                val memoryAsKb = memoryPart.toInt()
                Argon2idHasher.hash(salt, passwordBytes, iterations, memoryAsKb)
            }
            else -> throw IllegalArgumentException("Unsupported algorithm: $algorithm")
        }
    }
}
