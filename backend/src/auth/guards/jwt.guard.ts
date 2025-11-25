import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    getRequest(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();

        // Read token from cookies
        const token = req.cookies?.token;

        // If cookie exists → set Authorization header manually
        if (token) {
        req.headers.authorization = `Bearer ${token}`;
        }

        return req;
    }
}
