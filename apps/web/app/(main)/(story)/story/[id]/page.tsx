import { StoryInterface } from "@/components/story-interface";

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <StoryInterface storyId={id} />
}