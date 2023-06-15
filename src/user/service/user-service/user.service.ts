import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, catchError, } from 'rxjs/operators';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from 'src/user/model/user.inteface';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/service/auth.service';

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

    async login(user: UserI): Promise<string> {
        try {
          const foundUser: UserI = await this.findByEmail(user.email.toLowerCase());
          if (foundUser) {
            const matches: boolean = await this.validatePassword(user.password, foundUser.password);
            if (matches) {
              const payload: UserI = await this.findOne(foundUser.id);
              return this.authService.generateJwt(payload);
            } else {
              throw new HttpException('Login was not successfull, wrong credentials', HttpStatus.UNAUTHORIZED);
            }
          } else {
            throw new HttpException('Login was not successfull, wrong credentials', HttpStatus.UNAUTHORIZED);
          }
        } catch {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
      }

    private findByEmail(email: string): Promise<UserI> {
        return this.userRepository.findOne({ where: { email }, select: ['id', 'email', 'username', 'password'] });
    }

    private validatePassword(password: string, storedPasswordHas: string): Promise<any> {
        return this.authService.comparePasswords(password, storedPasswordHas);
    }

    private hashPassword(password: string): Observable<string> {
        return this.authService.hashPassword(password);
    }

    public getOne(id: number): Promise<UserI> {
        return this.userRepository.findOneOrFail({ where: { id } });
    }

    private mailExists(email: string): Observable<boolean> {
        return from(this.userRepository.findOne({ where: { email } })).pipe(
            map((user: UserI) => !!user)
        );
    }

    private findOne(id: number): Promise<UserI> {
        return this.userRepository.findOne({ where: { id } });
    }
}
