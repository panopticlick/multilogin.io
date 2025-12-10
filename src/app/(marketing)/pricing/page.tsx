import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Sparkles, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

export const metadata: Metadata = {
  title: 'Pricing - 永久免费',
  description: 'Multilogin.io 现已永久免费：所有功能向所有团队开放，无需信用卡、无升级弹窗。',
};

export default function PricingPage() {
  const features = [
    '无限浏览器配置文件与团队成员',
    '完整代理池与脚本自动化能力',
    '时间机器、健康检查、审计日志全部开放',
    '无需信用卡，立即上手',
  ];

  return (
    <div className="space-y-8">
      <BreadcrumbNav items={[{ name: 'Pricing', href: '/pricing' }]} />

      <header className="space-y-3 text-center">
        <Badge variant="secondary" className="text-xs">
          Free Forever
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">永久免费，所有功能开放</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          我们移除了所有订阅与付费墙。你和你的团队可立即使用全部功能，专注解决真实问题。
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/auth/login">
              <Sparkles className="h-4 w-4 mr-2" />
              立即开始
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/docs">查看文档</Link>
          </Button>
        </div>
      </header>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge>唯一计划</Badge>
            <span className="text-sm text-muted-foreground">Free Forever</span>
          </div>
          <p className="text-4xl font-bold tracking-tight mt-2">$0</p>
          <p className="text-muted-foreground">全量功能，无限团队成员，无时间限制。</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between py-6">
          <div className="flex items-start gap-3">
            <HeartHandshake className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">需要企业特性或部署帮助？</p>
              <p className="text-sm text-muted-foreground">
                免费不代表缺少支持。联系我们获取迁移指导、性能调优或私有部署建议。
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="mailto:support@multilogin.io">联系支持</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
