'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CertificatesTab } from '@/components/vault/certificates-tab'
import { SkillsTab } from '@/components/vault/skills-tab'
import { WorkSamplesTab } from '@/components/vault/work-samples-tab'
import { ReferencesTab } from '@/components/vault/references-tab'
import { Award, Code, FolderOpen, UserCheck } from 'lucide-react'

export default function VaultPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display text-gray-900">Credential Vault</h1>
        <p className="text-gray-500 mt-1">
          Store and organize your professional credentials, skills, work samples, and references.
        </p>
      </div>

      <Tabs defaultValue="certificates">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="certificates" className="flex items-center gap-1.5">
            <Award className="h-4 w-4" /> Certificates
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-1.5">
            <Code className="h-4 w-4" /> Skills
          </TabsTrigger>
          <TabsTrigger value="samples" className="flex items-center gap-1.5">
            <FolderOpen className="h-4 w-4" /> Work Samples
          </TabsTrigger>
          <TabsTrigger value="references" className="flex items-center gap-1.5">
            <UserCheck className="h-4 w-4" /> References
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certificates">
          <CertificatesTab />
        </TabsContent>
        <TabsContent value="skills">
          <SkillsTab />
        </TabsContent>
        <TabsContent value="samples">
          <WorkSamplesTab />
        </TabsContent>
        <TabsContent value="references">
          <ReferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
