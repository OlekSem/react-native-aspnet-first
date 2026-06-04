using back.Data;
using back.Entities.Identity;
using back.Interfaces;
using back.Models.Account;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace back.Controllers;

[ApiController]
[Route("/api/[controller]/[action]")]
public class AccountController(
    IJwtTokenService jwtTokenService,
    UserManager<UserEntity> userManager, // Corrected from AppDbContext
    SignInManager<UserEntity> signInManager // Added to handle password checks
) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var user = await userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            return Unauthorized("Invalid email or password");
        }

        // Use SignInManager to properly verify the password and handle lockout policies
        var result = await signInManager.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: false);
        
        if (!result.Succeeded)
        {
            return Unauthorized("Invalid email or password");
        }

        var token = await jwtTokenService.CreateTokenAsync(user);
        return Ok(new { Token = token });
    }
}