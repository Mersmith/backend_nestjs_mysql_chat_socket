import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, catchError, } from 'rxjs/operators';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from 'src/user/model/user.inteface';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/service/auth.service';

const bcrypt = require('bcrypt');

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        private authService: AuthService
    ) { }

    create(newUser: UserI): Observable<UserI> {
        return this.mailExists(newUser.email).pipe(
            switchMap((exists: boolean) => {
                if (!exists) {
                    return this.hashPassword(newUser.password).pipe(
                        switchMap((passwordHash: string) => {
                            newUser.password = passwordHash;
                            return from(this.userRepository.save(newUser)).pipe(
                                switchMap((user: UserI) => this.findOne(user.id))
                            );
                        })
                    )
                } else {
                    throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
                }
            })
        );
    }

    findAll(options: IPaginationOptions): Observable<Pagination<UserI>> {
        return from(paginate<UserEntity>(this.userRepository, options));
    }

    login(user: UserI): Observable<string> {
        return this.findByEmail(user.email).pipe(
            switchMap((foundUser: UserI) => {
                if (foundUser) {
                    return this.validatePassword(user.password, foundUser.password).pipe(
                        switchMap((matches: boolean) => {
                            if (matches) {
                                return this.findOne(foundUser.id).pipe(
                                    switchMap((payload: UserI) => this.authService.generateJwt(payload))
                                )
                                //return of(true);
                            } else {
                                throw new HttpException('Login was not successful, wrong credentials', HttpStatus.UNAUTHORIZED);
                            }
                        })
                    );
                } else {
                    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
                }
            }),
            catchError((error) => {
                throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
            })
        );
    }


    private findByEmail(email: string): Observable<UserI> {
        return from(this.userRepository.findOne({ where: { email }, select: ['id', 'email', 'username', 'password'] }));
    }


    private validatePassword(password: string, storedPasswordHas: string): Observable<any> {
        return this.authService.comparePasswords(password, storedPasswordHas);
    }

    private hashPassword(password: string): Observable<string> {
        return this.authService.hashPassword(password);
    }

    private mailExists(email: string): Observable<boolean> {
        return from(this.userRepository.findOne({ where: { email } })).pipe(
            map((user: UserI) => !!user)
        );
    }

    private findOne(id: number): Observable<UserI> {
        return from(this.userRepository.findOne({ where: { id } }));
    }
}
