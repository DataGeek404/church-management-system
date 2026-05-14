import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Member } from './entities/member.entity';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async create(createMemberDto: CreateMemberDto) {
    const existingMember = await this.memberRepository.findOne({
      where: { email: createMemberDto.email.toLowerCase() },
    });

    if (existingMember) {
      throw new BadRequestException('Member with this email already exists');
    }

    // Normalize phone number field (accept both phoneNumber and phone)
    const phoneNumber = createMemberDto.phoneNumber || createMemberDto.phone;

    const member = this.memberRepository.create({
      id: uuid(),
      firstName: createMemberDto.firstName,
      lastName: createMemberDto.lastName,
      email: createMemberDto.email.toLowerCase(),
      phone: phoneNumber,
      address: createMemberDto.address,
      dateJoined: createMemberDto.dateJoined || new Date(),
    });

    return this.memberRepository.save(member);
  }

  async findAll(status?: string) {
    const query = this.memberRepository.createQueryBuilder('member');

    if (status) {
      query.where('member.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const member = await this.memberRepository.findOne({ where: { id } });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    await this.findOne(id); // Verify member exists

    await this.memberRepository.update(id, updateMemberDto);

    return this.findOne(id);
  }

  async remove(id: string) {
    const member = await this.findOne(id);

    await this.memberRepository.remove(member);

    return { message: 'Member deleted successfully' };
  }

  async getStats() {
    const total = await this.memberRepository.count();
    const active = await this.memberRepository.count({ where: { status: 'active' } });
    const inactive = await this.memberRepository.count({ where: { status: 'inactive' } });

    return {
      total,
      active,
      inactive,
    };
  }
}

