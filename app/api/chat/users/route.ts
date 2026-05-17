import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// Supports optional filtering via query parameters:
// GET /api/chat/users?schoolId=<id>&role=INCHARGE|PRINCIPAL|CORRESPONDENT|MENTOR|STUDENT
// Falls back to all users when no filter provided (legacy behavior).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get('schoolId');
  const role = searchParams.get('role');
  try {
    if (schoolId && role) {
      const roleUpper = role.toUpperCase();
      const valid = ['INCHARGE', 'PRINCIPAL', 'CORRESPONDENT', 'MENTOR', 'STUDENT'];
      if (!valid.includes(roleUpper)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }

      // Role-specific sources
      if (roleUpper === 'STUDENT') {
        const students = await prisma.student.findMany({
          where: { school_id: schoolId },
          select: { user: { select: { id: true, email: true, first_name: true, last_name: true } } },
          take: 250,
        });
        const users = students
          .map(s => s.user)
          .filter(Boolean)
          .map(u => ({ id: u!.id, email: u!.email, first_name: u!.first_name, last_name: u!.last_name }));
        return NextResponse.json({ users });
      }
      if (roleUpper === 'MENTOR') {
        const mentors = await prisma.mentor.findMany({
          where: { school_ids: { has: schoolId } },
          select: { user: { select: { id: true, email: true, first_name: true, last_name: true } } },
          take: 250,
        });
        const users = mentors
          .map(m => m.user)
          .filter(Boolean)
          .map(u => ({ id: u!.id, email: u!.email, first_name: u!.first_name, last_name: u!.last_name }));
        return NextResponse.json({ users });
      }

      // Admin-style roles from rolesBySchool metadata
      const candidates = await prisma.user.findMany({
        where: { schools: { has: schoolId } },
        select: { id: true, email: true, first_name: true, last_name: true, user_meta_data: true },
        take: 500,
      });
      const filtered = candidates.filter(u => {
        const meta: any = u.user_meta_data || {};
        const rbs = meta.rolesBySchool || {};
        const roles = rbs[schoolId];
        if (!roles) return false;
        if (Array.isArray(roles)) return roles.map((r: string) => r.toUpperCase()).includes(roleUpper);
        return (roles as string).toUpperCase() === roleUpper;
      }).map(u => ({ id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name }));
      return NextResponse.json({ users: filtered });
    }

    // Fallback: all users (legacy usage by existing ManageMembersModal search)
    const users = await prisma.user.findMany({ select: { id: true, email: true, first_name: true, last_name: true, user_meta_data: true }, take: 500 });
    return NextResponse.json({ users });
  } catch (e: any) {
    console.error('Failed to fetch users', e);
    return NextResponse.json({ error: e.message || 'Failed to fetch users' }, { status: 500 });
  }
}