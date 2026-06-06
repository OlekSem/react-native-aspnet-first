using back.Entities.Identity;
using back.Models.Account;
using back.Models.Seeder;
using Riok.Mapperly.Abstractions;

namespace back.Mappers;

[Mapper]
public partial class UserMapper
{
    [MapProperty(nameof(UserSeederModel.Email), nameof(UserEntity.UserName))]
    public partial UserEntity UserSeedToUser(UserSeederModel model);

    [MapProperty(nameof(UserSeederModel.Email), nameof(UserEntity.UserName))]
    public partial UserEntity RegisterUserToUser(RegisterModel model);
}