using back.Constants;
using back.Data;
using back.Entities.Identity;
using back.Interfaces;
using back.Mappers;
using back.Models.Account;
using back.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace back.Controllers;

[ApiController]
[Route("/api/[controller]/[action]")]
public class AccountController(
    IJwtTokenService jwtTokenService,
    UserManager<UserEntity> userManager, // Corrected from AppDbContext
    SignInManager<UserEntity> signInManager, // Added to handle password checks
    UserMapper userMapper,
    IImageService imageService
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
        return Ok(token);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Register([FromForm] RegisterModel model)
    {
        var user = await userManager.FindByEmailAsync(model.Email);

        if (user != null)
        {
            return BadRequest("Email is already in use");
        }

        user = userMapper.RegisterUserToUser(model);

        if (model.Image != null)
        {
            user.Image = await imageService.SaveImageAsync(model.Image);
        }

        var result = await userManager.CreateAsync(user, model.Password);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(user, Roles.User);
            var token = await jwtTokenService.CreateTokenAsync(user);
            return Ok(new { token });
        }
        return BadRequest(result.Errors);
    }
}