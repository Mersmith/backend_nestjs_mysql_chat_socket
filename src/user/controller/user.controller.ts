import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from '../service/user-service/user.service';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { Observable } from 'rxjs';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { UserI } from '../model/user.inteface';
import { switchMap } from 'rxjs/operators';
import { Pagination } from 'nestjs-typeorm-paginate';
import { LoginUserDto } from '../model/dto/login-user.dto';
@Controller('users')
export class UserController {

    constructor(
        private userService: UserService,
        private userHelperService: UserHelperService
    ) { }

    @Post()
    create(@Body() createUserDto: CreateUserDto): Observable<UserI> {
        return this.userHelperService.createUserDtoEntity(createUserDto).pipe(
            switchMap((user: UserI) => this.userService.create(user))
        )
    }

    @Get()
    findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Observable<Pagination<UserI>> {
        limit = limit > 100 ? 100 : limit;
        return this.userService.findAll({
            page,
            limit,
            route: 'http://localhost:3000/api/users'
        });
    }

    @Post('login')
    login(@Body() LoginUserDto: LoginUserDto): Observable<boolean>{
        return this.userHelperService.loginUserDtoEntity(LoginUserDto).pipe(
            switchMap((user: UserI) => this.userService.login(user))
        )
    }

}
