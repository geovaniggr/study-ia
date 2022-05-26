export const createAndSendMessage = async (message, handler) => {
    const socket = new WebSocket("ws://localhost:3333")

    socket.addEventListener("open", () => {
        console.log("[Socket]: Conexão Iniciada")
        socket.send(JSON.stringify(message))
    })
    socket.addEventListener("message", (event) => handler(event))
    socket.addEventListener("close", () => console.log("Finalizando a Conexão"))
}