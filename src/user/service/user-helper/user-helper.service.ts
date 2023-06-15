import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { CreateUserDto } from 'src/user/model/dto/create-user.dto';
import { LoginUserDto } from 'src/user/model/dto/login-user.dto';
import { UserI } from 'src/user/model/user.inteface';

@Injectable()
export class UserHelperService {

    createUserDtoEntity(createUserDto: CreateUserDto): Observable<UserI> {
        return of({
            email: createUserDto.email,
            username: createUserDto.username,
            password: createUserDto.password
        });
    }

    loginUserDtoEntity(loginUserDto: LoginUserDto): UserI {
        return {
            email: loginUserDto.email,
            password: loginUserDto.password
        };
    }

}
