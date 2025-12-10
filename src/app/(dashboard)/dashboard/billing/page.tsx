'use client';

import Link from 'next/link';
import { Card, GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Shield, HeartHandshake } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">永久免费</h1>
        <p className="text-muted-foreground">
          没有订阅、没有隐藏限制——所有功能对所有团队永久开放。
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-xs">
            Free Forever
          </Badge>
          <span className="text-sm text-muted-foreground">
            统一的免费计划，保留完整功能与支持。
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            '无限浏览器配置文件与团队成员',
            '内置代理与脚本管理，无额外付费',
            '时间机器与健康检查等高级功能开放',
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          你可以直接开始使用，不需要信用卡，也不会出现升级弹窗。
        </p>
        <Button asChild>
          <Link href="/dashboard">
            <Sparkles className="h-4 w-4 mr-2" />
            返回控制台
          </Link>
        </Button>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="p-6 space-y-3 border-primary/10">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">简单的安全与合规</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            我们仍然保留审计日志、身份验证和速率限制，确保免费但不降低安全性。
          </p>
        </GlassCard>

        <GlassCard className="p-6 space-y-3 border-primary/10">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">需要帮助？</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            有任何需求或改进建议？发邮件至{' '}
            <Link href="mailto:support@multilogin.io" className="underline">
              support@multilogin.io
            </Link>
            ，我们会优先响应。
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
