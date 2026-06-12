using Microsoft.AspNetCore.SignalR;

namespace back.Hubs;

public class ChatMessage 
{
    public string Username { get; set; }
    public string Text { get; set; }
}

public class ChatHub : Hub
{
    public async Task Send(ChatMessage message)
    {
        await Clients.All.SendAsync("Send", message);
    }
}