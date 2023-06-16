import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, from } from 'rxjs';
import { UserI } from 'src/user/model/user.inteface';

const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {

    constructor(private readonly jwtService: JwtService) { }

    async generateJwt(user: UserI): Promise<string> {
        return this.jwtService.signAsync({ user });
    }

    async hashPassword(password: string): Promise<string> {
        return (bcrypt.hash(password, 12));
    }

    async comparePasswords(password: string, storedPasswordHas: string): Promise<any> {
        return bcrypt.compare(password, storedPasswordHas);
    }

    verifyJwt(jwt: string): Promise<any> {
        return this.jwtService.verifyAsync(jwt);
    }

}