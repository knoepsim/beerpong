import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cookie = request.headers.cookie;

    if (!cookie) {
      throw new UnauthorizedException('No cookies found');
    }

    const cookieName = process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
    const match = cookie.match(new RegExp(`${cookieName}=([^;]+)`));
    const sessionToken = match?.[1];

    if (!sessionToken) {
      throw new UnauthorizedException('No session token found');
    }

    const session = await this.prisma.client.session.findUnique({
        where: { sessionToken },
        include: { user: true }
    });

    if (!session || session.expires < new Date()) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    request.user = session.user;
    return true;
  }
}
