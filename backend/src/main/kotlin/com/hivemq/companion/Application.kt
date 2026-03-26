package com.hivemq.companion

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun main() {
    embeddedServer(Netty, port = 8989) {
        module()
    }.start(wait = true)
}

fun Application.module() {
    routing {
        get("/health/live") {
            call.respondText("OK")
        }
    }
}
