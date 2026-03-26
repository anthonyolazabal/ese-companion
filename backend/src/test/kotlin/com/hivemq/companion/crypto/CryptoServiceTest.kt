package com.hivemq.companion.crypto

import org.bouncycastle.util.encoders.Base64
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class CryptoServiceTest {

    private lateinit var cryptoService: CryptoService
    private val salt = Base64.decode("c2FsdA==") // "salt"

    @BeforeTest
    fun setUp() {
        cryptoService = CryptoService()
    }

    @Test
    fun `PLAIN hashing returns base64 encoded password`() {
        val result = cryptoService.hashPassword("password", "PLAIN", 0)
        assertEquals("cGFzc3dvcmQ=", result.hash)
        assertEquals("", result.salt)
        assertEquals("PLAIN", result.algorithm)
        assertEquals(0, result.iterations)
    }

    @Test
    fun `MD5 hashing matches ESE helper output`() {
        val result = cryptoService.hashPassword("password", "MD5", 10, salt)
        assertEquals("FEZXLgoeDSdbbR7FHWHVsQ==", result.hash)
    }

    @Test
    fun `SHA512 hashing matches ESE helper output`() {
        val result = cryptoService.hashPassword("password", "SHA512", 10, salt)
        assertEquals("Oat8l5/qDJ/1u1iw1gCaGVlIkpEOwry8N+rLgD9guzFUa3/4+MszZLCN3tu7fvCKpGmI4WVkMvCj0l6M06WtWA==", result.hash)
    }

    @Test
    fun `PKCS5S2 hashing matches ESE helper output`() {
        val result = cryptoService.hashPassword("password", "PKCS5S2", 10, salt)
        assertEquals("3tX9NqzigBkQgHCstazJ24kusEIw9x7Np3wNv5fjio0=", result.hash)
    }

    @Test
    fun `BCRYPT hashing matches ESE helper output`() {
        val result = cryptoService.hashPassword("password", "BCRYPT", 10, salt)
        assertEquals("9QWSrHiFIROKU05wpfM66ejEgCqhDNTw", result.hash)
    }

    @Test
    fun `ARGON2ID_47104KB hashing matches ESE helper output`() {
        val result = cryptoService.hashPassword("password", "ARGON2ID_47104KB", 1, salt)
        assertEquals("thTADJvVyfkjgiOW37TAJemBbXUaXj6/B3Zm8qI4Ytw=", result.hash)
    }

    @Test
    fun `ARGON2ID_19456KB hashing matches ESE helper output`() {
        val result = cryptoService.hashPassword("password", "ARGON2ID_19456KB", 2, salt)
        assertEquals("9QyfT5o7Sa27GSMOCN2GzdqaNwYMX8RmDMyUUqwHjfY=", result.hash)
    }

    @Test
    fun `ARGON2ID_7168KB hashing matches ESE helper output`() {
        val result = cryptoService.hashPassword("password", "ARGON2ID_7168KB", 5, salt)
        assertEquals("JzWNLXOlID8L2wYniJNhEwcBjP2JWcy4/0LkxDdLAGI=", result.hash)
    }

    @Test
    fun `generateSalt returns 16 bytes`() {
        val generatedSalt = cryptoService.generateSalt()
        assertEquals(16, generatedSalt.size)
    }

    @Test
    fun `verifyPassword returns true for correct password`() {
        val result = cryptoService.hashPassword("password", "SHA512", 10, salt)
        assertTrue(cryptoService.verifyPassword("password", result.hash, result.salt, "SHA512", 10))
    }

    @Test
    fun `verifyPassword returns false for wrong password`() {
        val result = cryptoService.hashPassword("password", "SHA512", 10, salt)
        assertFalse(cryptoService.verifyPassword("wrong", result.hash, result.salt, "SHA512", 10))
    }

    @Test
    fun `verifyPassword works for PLAIN`() {
        val result = cryptoService.hashPassword("password", "PLAIN", 0)
        assertTrue(cryptoService.verifyPassword("password", result.hash, "", "PLAIN", 0))
        assertFalse(cryptoService.verifyPassword("wrong", result.hash, "", "PLAIN", 0))
    }

    @Test
    fun `verifyPassword works for BCRYPT`() {
        val result = cryptoService.hashPassword("password", "BCRYPT", 10, salt)
        assertTrue(cryptoService.verifyPassword("password", result.hash, result.salt, "BCRYPT", 10))
        assertFalse(cryptoService.verifyPassword("wrong", result.hash, result.salt, "BCRYPT", 10))
    }

    @Test
    fun `unsupported algorithm throws exception`() {
        assertFailsWith<IllegalArgumentException> {
            cryptoService.hashPassword("password", "UNKNOWN", 10, salt)
        }
    }
}
