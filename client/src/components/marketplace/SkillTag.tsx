import { Badge } from "@/components/ui/badge";

interface SkillTagProps {
  skill: string;
  onClick?: () => void;
  selected?: boolean;
}

const SkillTag = ({ skill, onClick, selected = false }: SkillTagProps) => {
  return (
    <Badge
      variant={selected ? "default" : "secondary"}
      className={`bg-gray-100 text-secondary text-xs font-medium px-2 py-1 rounded ${
        onClick ? "cursor-pointer hover:bg-gray-200" : ""
      } ${
        selected ? "bg-accent text-white" : ""
      }`}
      onClick={onClick}
    >
      {skill}
    </Badge>
  );
};

export default SkillTag;
