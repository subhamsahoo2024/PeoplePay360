import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceRoleClient, createUserScopedClient } from '@/lib/supabase/server';
import type { AppRole } from '@/lib/supabase/database.types';

const inputSchema=z.object({companyId:z.string().uuid(),fullName:z.string().trim().min(2).max(120),personalEmail:z.string().email(),departmentId:z.string().uuid(),positionId:z.string().uuid(),employmentCategory:z.enum(['full_time','part_time','contractor','intern','trainee']),applicationRole:z.enum(['employee','hr_manager','payroll_user','payroll_manager','admin']),joiningDate:z.string().date()});
const bearer=(r:NextRequest)=>r.headers.get('authorization')?.replace(/^Bearer\s+/,'')||null;

export async function POST(request:NextRequest){
  try{
    const token=bearer(request);if(!token)return NextResponse.json({error:{code:'UNAUTHENTICATED',message:'Bearer token required'}},{status:401});
    const input=inputSchema.parse(await request.json());const scoped=createUserScopedClient(token);const service=createServiceRoleClient();
    const {data:auth,error:authError}=await scoped.auth.getUser(token);if(authError||!auth.user)return NextResponse.json({error:{code:'UNAUTHENTICATED',message:'Invalid session'}},{status:401});
    const {data:roles}=await scoped.from('user_company_roles').select('role').eq('company_id',input.companyId).eq('user_id',auth.user.id);
    const callerRoles=roles?.map(r=>r.role)??[];if(!callerRoles.some(r=>r==='hr_manager'||r==='admin'))return NextResponse.json({error:{code:'FORBIDDEN',message:'HR Manager or Admin role required'}},{status:403});
    if(input.applicationRole==='admin'&&!callerRoles.includes('admin'))return NextResponse.json({error:{code:'FORBIDDEN',message:'Only Admin can invite another Admin'}},{status:403});
    const {data:company,error:companyError}=await service.from('companies').select('*').eq('id',input.companyId).single();if(companyError||!company)throw companyError??new Error('Company not found');
    const domain=company.organization_email_domain;if(!domain)throw new Error('Company organization email domain is not configured');
    const clean=(value:string)=>value.normalize('NFKD').replace(/[^a-zA-Z\s]/g,'').toLowerCase();const parts=clean(input.fullName).trim().split(/\s+/);const first=parts[0],last=parts.at(-1)??first;
    const local=(company.employee_email_pattern||'{first}.{last}').replaceAll('{first}',first).replaceAll('{last}',last).replace(/[^a-z0-9._-]/g,'');
    let companyEmail=`${local}@${domain}`;for(let n=1;n<100;n++){const {data}=await service.from('employees').select('id').eq('company_id',input.companyId).eq('company_email',companyEmail).maybeSingle();if(!data)break;companyEmail=`${local}${n+1}@${domain}`}
    const redirectTo=`${process.env.APP_URL??request.nextUrl.origin}/onboarding`;
    const generated=await service.auth.admin.generateLink({type:'invite',email:companyEmail,options:{redirectTo,data:{full_name:input.fullName,personal_email:input.personalEmail}}});if(generated.error)throw generated.error;
    const user=generated.data.user;const actionLink=generated.data.properties.action_link;
    const employeeCode=`PP-${new Date().getUTCFullYear()}-${user.id.slice(0,6).toUpperCase()}`;
    const {data:employee,error:employeeError}=await service.from('employees').insert({company_id:input.companyId,user_id:user.id,employee_code:employeeCode,full_name:input.fullName,company_email:companyEmail,department_id:input.departmentId,position_id:input.positionId,joining_date:input.joiningDate,status:'onboarding',employment_category:input.employmentCategory,onboarding_status:'invited'}).select().single();if(employeeError||!employee)throw employeeError??new Error('Employee creation failed');
    const role=input.applicationRole as AppRole;const roleInsert=await service.from('user_company_roles').insert([{company_id:input.companyId,user_id:user.id,role:'employee'},{company_id:input.companyId,user_id:user.id,role}].filter((r,i,a)=>a.findIndex(x=>x.role===r.role)===i));if(roleInsert.error)throw roleInsert.error;
    const expiresAt=new Date(Date.now()+24*60*60*1000).toISOString();const tokenHash=createHash('sha256').update(actionLink).digest('hex');const invitation=await service.from('employee_invitations').insert({company_id:input.companyId,employee_id:employee.id,invited_email:companyEmail,application_role:role,token_hash:tokenHash,expires_at:expiresAt,invited_by:auth.user.id}).select().single();if(invitation.error)throw invitation.error;
    await service.from('audit_logs').insert({company_id:input.companyId,actor_user_id:auth.user.id,action:'employee_account_created',entity_table:'employees',entity_id:employee.id,summary:{application_role:role,company_email:companyEmail}});
    return NextResponse.json({employee:{id:employee.id,employeeCode,fullName:input.fullName,organizationEmail:companyEmail},invitation:{id:invitation.data.id,activationLink:actionLink,expiresAt},composer:{to:input.personalEmail,cc:'',subject:`Activate your ${company.name} PeoplePay360 account`,message:`Hello ${first},\n\nYour PeoplePay360 account is ready. Activate ${companyEmail} using the secure link below. The link expires at ${new Date(expiresAt).toLocaleString('en-IN')}.\n\n${actionLink}\n\nNo permanent password is included in this email.`}},{status:201});
  }catch(error){const message=error instanceof Error?error.message:'Unable to create employee account';return NextResponse.json({error:{code:'EMPLOYEE_INVITE_ERROR',message}},{status:400})}
}
