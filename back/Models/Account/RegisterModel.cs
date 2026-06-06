using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace back.Models.Account;

public class RegisterModel
{
    [Required]
    public string FirstName { get; set; }
    [Required]
    public string LastName { get; set; }
    [Required]
    public string Email { get; set; }
    [Required]
    public string Password { get; set; }
    
    [FromForm]
    public IFormFile? Image { get; set; }
}