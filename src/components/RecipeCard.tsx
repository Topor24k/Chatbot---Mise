import { Clock, ChefHat, Globe, Send, Utensils, AlertTriangle, Tool, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Recipe } from '../chatTypes';
import { cleanAssistantText } from '../chatUtils';

interface RecipeCardProps {
  recipe: Recipe;
  onSave: () => void;
  isSaved: boolean;
}

export default function RecipeCard({ recipe, onSave, isSaved }: RecipeCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white border border-[#E8E8E8] rounded-[28px] overflow-hidden shadow-[0_18px_50px_rgba(7,19,43,0.12)] max-w-3xl w-full flex flex-col"
    >
      <div className="bg-[#07132B] p-6 md:p-8 text-white shrink-0">
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">{cleanAssistantText(recipe.cuisineType)}</span>
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.25em]">
            <Globe size={12} />
            <span>Ethical Source</span>
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight leading-tight mb-2">
          {cleanAssistantText(recipe.name)}
        </h2>
        <p className="text-sm md:text-[15px] font-medium text-white/65 max-w-2xl">
          {cleanAssistantText(recipe.description || 'A practical recipe that is easy to save, revisit, and adapt to local ingredients.')}
        </p>
      </div>

      <div className="p-5 md:p-8 space-y-6 md:space-y-8 flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 pb-5 border-b border-[#F7F7F7]">
          <NutritionTile label="Cal" value={cleanAssistantText(recipe.nutritionFacts.calories)} />
          <NutritionTile label="Protein" value={cleanAssistantText(recipe.nutritionFacts.protein)} />
          <NutritionTile label="Carbs" value={cleanAssistantText(recipe.nutritionFacts.carbs)} />
          <NutritionTile label="Fat" value={cleanAssistantText(recipe.nutritionFacts.fat)} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-start">
          <div className="space-y-4 bg-[#F8F9FB] border border-[#EEF1F6] rounded-2xl p-4 md:p-5">
            <h3 className="text-[11px] font-bold text-[#8B8B8B] uppercase tracking-[0.25em] flex items-center gap-2">
              <Utensils size={14} className="text-[#07132B]" />
              Ingredients
            </h3>
            <ul className="space-y-2.5">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-[#FF1E1E] mt-2 shrink-0" />
                  <span className="text-sm md:text-[15px] font-medium text-[#4B5563] leading-tight">{cleanAssistantText(ingredient)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 bg-[#F8F9FB] border border-[#EEF1F6] rounded-2xl p-4 md:p-5">
            <h3 className="text-[11px] font-bold text-[#8B8B8B] uppercase tracking-[0.25em] flex items-center gap-2">
              <Clock size={14} className="text-[#07132B]" />
              Steps
            </h3>
            <div className="space-y-4">
              {recipe.instructions.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <span className="w-7 h-7 rounded-full bg-[#07132B] text-white flex items-center justify-center text-[11px] font-bold shrink-0">{index + 1}</span>
                  <p className="text-sm md:text-[15px] font-medium text-[#4B5563] leading-relaxed">{cleanAssistantText(step)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {(recipe.sustainabilityNote || recipe.resourceConservationTip || recipe.wasteZeroGuidance) && (
          <div className="space-y-4 pt-4">
            {recipe.sustainabilityNote && (
              <div className="flex gap-4 p-4 bg-[#FEF3E8] border border-[#F5DCC8] rounded-2xl">
                <AlertTriangle size={20} className="text-[#8B6B3E] shrink-0" />
                <div>
                  <h3 className="text-[11px] font-bold text-[#8B6B3E] uppercase tracking-[0.25em] mb-2">Sustainability Note</h3>
                  <p className="text-sm text-[#8B6B3E] leading-relaxed">{cleanAssistantText(recipe.sustainabilityNote)}</p>
                </div>
              </div>
            )}

            {recipe.resourceConservationTip && (
              <div className="flex gap-4 p-4 bg-[#F0F6F1] border border-[#D8E8DC] rounded-2xl">
                <Tool size={20} className="text-[#4B7052] shrink-0" />
                <div>
                  <h3 className="text-[11px] font-bold text-[#4B7052] uppercase tracking-[0.25em] mb-2">Chef's Secret</h3>
                  <p className="text-sm text-[#4B7052] italic leading-relaxed">Resource Conservation Tip: {cleanAssistantText(recipe.resourceConservationTip)}</p>
                </div>
              </div>
            )}

            {recipe.wasteZeroGuidance && recipe.wasteZeroGuidance.length > 0 && (
              <div className="p-4 bg-[#F0F6F1] border border-[#D8E8DC] rounded-2xl">
                <h3 className="text-[11px] font-bold text-[#4B7052] uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
                  <Trash2 size={16} className="text-[#4B7052]" />
                  Zero-Waste Guidance
                </h3>
                <ul className="space-y-2">
                  {recipe.wasteZeroGuidance.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[#4B7052] font-bold shrink-0">•</span>
                      <span className="text-sm text-[#4B7052] leading-relaxed">{cleanAssistantText(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 md:pt-4 border-t border-[#F7F7F7] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-[#000000] flex items-center justify-center text-white">
              <ChefHat size={14} />
            </div>
            <span className="text-[10px] md:text-[11px] font-bold text-[#8B8B8B] uppercase tracking-[0.22em]">Guaranteed Ethical</span>
          </div>
          <button onClick={onSave} className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.22em] text-[#FF1E1E] hover:opacity-70 transition-opacity flex items-center gap-2">
            {isSaved ? 'Saved' : 'Tap to Save'}
            <Send size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function NutritionTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F8F9FB] border border-[#EEF1F6] p-3 md:p-4 space-y-1">
      <div className="text-[9px] font-bold text-[#8B8B8B] uppercase tracking-[0.22em]">{label}</div>
      <div className="text-sm md:text-base font-display font-extrabold text-[#000000] tracking-tight">{value}</div>
    </div>
  );
}
