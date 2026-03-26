package com.hivemq.companion.crypto

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNotEquals

class AesEncryptionTest {

    @Test
    fun `encrypts and decrypts round-trip`() {
        val aes = AesEncryption("my-secret-encryption-key-12345")
        val plaintext = "my-database-password"
        val encrypted = aes.encrypt(plaintext)
        assertNotEquals(plaintext, encrypted)
        assertEquals(plaintext, aes.decrypt(encrypted))
    }

    @Test
    fun `different encryptions of same plaintext produce different ciphertext`() {
        val aes = AesEncryption("my-secret-encryption-key-12345")
        val e1 = aes.encrypt("password")
        val e2 = aes.encrypt("password")
        assertNotEquals(e1, e2)
    }

    @Test
    fun `wrong key fails to decrypt`() {
        val aes1 = AesEncryption("key-one-for-encryption-12345")
        val aes2 = AesEncryption("key-two-for-decryption-12345")
        val encrypted = aes1.encrypt("secret")
        assertFailsWith<Exception> {
            aes2.decrypt(encrypted)
        }
    }
}
