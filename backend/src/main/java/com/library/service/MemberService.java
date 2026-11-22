package com.library.service;

import com.library.dto.MemberRequest;
import com.library.entity.Member;
import com.library.entity.TransactionStatus;
import com.library.exception.BadRequestException;
import com.library.exception.ConflictException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookTransactionRepository;
import com.library.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final BookTransactionRepository transactionRepository;

    public MemberService(MemberRepository memberRepository,
                         BookTransactionRepository transactionRepository) {
        this.memberRepository = memberRepository;
        this.transactionRepository = transactionRepository;
    }

    // Returns all members, optionally filtered by name
    @Transactional(readOnly = true)
    public List<Member> getMembers(String name) {
        if (name != null && !name.trim().isEmpty()) {
            return memberRepository.findByNameContainingIgnoreCase(name.trim());
        }
        return memberRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Member getMemberById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id " + id));
    }

    @Transactional
    public Member addMember(MemberRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (memberRepository.existsByEmail(email)) {
            throw new ConflictException("A member with email " + email + " already exists");
        }

        Member member = new Member();
        member.setName(request.getName().trim());
        member.setEmail(email);
        member.setPhone(request.getPhone() == null ? null : request.getPhone().trim());
        return memberRepository.save(member);
    }

    @Transactional
    public Member updateMember(Long id, MemberRequest request) {
        Member member = getMemberById(id);

        String email = request.getEmail().trim().toLowerCase();
        if (!email.equals(member.getEmail()) && memberRepository.existsByEmail(email)) {
            throw new ConflictException("A member with email " + email + " already exists");
        }

        member.setName(request.getName().trim());
        member.setEmail(email);
        member.setPhone(request.getPhone() == null ? null : request.getPhone().trim());
        return memberRepository.save(member);
    }

    @Transactional
    public void deleteMember(Long id) {
        Member member = getMemberById(id);

        if (transactionRepository.existsByMemberIdAndStatus(id, TransactionStatus.ISSUED)) {
            throw new BadRequestException("Cannot delete a member who has books currently issued");
        }
        // Past (returned) transactions also reference this member, so the database blocks deletion.
        if (transactionRepository.existsByMemberId(id)) {
            throw new ConflictException("Cannot delete a member who has transaction history");
        }

        memberRepository.delete(member);
    }
}