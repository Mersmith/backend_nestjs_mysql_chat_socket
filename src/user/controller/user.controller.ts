import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from '../service/user-service/user.service';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { Observable } from 'rxjs';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { UserI } from '../model/user.inteface';
import { switchMap, map } from 'rxjs/operators';
import { Pagination } from 'nestjs-typeorm-paginate';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { LoginResponseI } from '../model/login-response.inteface';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
@Controller('users')
export class UserController {

    constructor(
        private userService: UserService,
        private userHelperService: UserHelperService
    ) { }

    @Post()
    create(
        @Body()
        createUserDto: CreateUserDto
    ): Promise<UserI> {
        const userEntity = this.userHelperService.createUserDtoEntity(createUserDto);
        return this.userService.create(userEntity);
    }

    @Get()
    findAll(
        @Query('page')
        page: number = 1,

        @Query('limit')
        limit: number = 10,
    ): Promise<Pagination<UserI>> {
        limit = limit > 100 ? 100 : limit;
        return this.userService.findAll({
            page,
            limit,
            route: process.env.BASE_URL + '/api/users'
        });
    }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseI> {
        const userEntity: UserI = this.userHelperService.loginUserDtoEntity(loginUserDto);
        const jwt: string = await this.userService.login(userEntity);
        return {
            access_token: jwt,
            token_type: 'JWT',
            expires_in: 10000
        };
    }

    //http://localhost:3000/api/users/find-by-username?username=R
    @Get('/find-by-username')
    async findAllByUsername(
        @Query('username')
        username: string
    ){
        return this.userService.findAllByUsername(username);
    }


}
