'use client';

import { useLawyers } from '@/app/contexts/LawyersContext';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '../contexts/AuthContext';
import LawyerCard from '@/components/LawyerCard';
import { Check, ChevronDown, Star, Settings } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

function LawyersPage() {
  const { lawyers, isLoading, error } = useLawyers();
  const { session } = useAuth();
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingRange, setRatingRange] = useState([0]); // Rating filter from 0-5
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [experienceRange, setExperienceRange] = useState([0]); // Years of experience

  const specializations = useMemo(() => {
    if (!lawyers) return [];
    
    // Get all unique specializations from lawyers
    const allSpecializations = lawyers
      .filter(lawyer => !lawyer.isAI) // Exclude AI lawyer
      .flatMap(lawyer => lawyer.specializations || []);
    
    // Remove duplicates and sort
    return [...new Set(allSpecializations)].sort();
  }, [lawyers]);

  const filteredSpecializations = useMemo(() => {
    return specializations.filter(spec => 
      spec.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [specializations, searchTerm]);

  const filteredLawyers = useMemo(() => {
    if (!lawyers) return [];
    
    return lawyers.filter((lawyer) => {
      // Filter out current user
      if (lawyer.user_id === session?.user?.id) return false;
      
      // Always include AI lawyer
      if (lawyer.isAI) return true;

      // Check specializations
      const matchesSpecializations = selectedSpecializations.length === 0 || 
        selectedSpecializations.every(spec => lawyer.specializations?.includes(spec));

      // Check rating
      const rating = lawyer.rating || 0;
      const matchesRating = rating >= ratingRange[0];

      // Check verification status
      const matchesVerification = !showVerifiedOnly || lawyer.isVerified;

      // Check experience - use yearsOfExperience from transformed data
      const experience = lawyer.yearsOfExperience || 0;
      const matchesExperience = experience >= experienceRange[0];

      return matchesSpecializations && matchesRating && matchesVerification && matchesExperience;
    });
  }, [lawyers, selectedSpecializations, ratingRange, showVerifiedOnly, experienceRange, session?.user?.id]);

  const toggleSpecialization = (specialization) => {
    setSelectedSpecializations(prev => {
      if (prev.includes(specialization)) {
        return prev.filter(s => s !== specialization);
      } else {
        return [...prev, specialization];
      }
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='container px-4 py-4 mx-auto'>
      {/* Filters section */}
      <div className='mb-6 space-y-4'>
        <div className="flex flex-row gap-4 md:flex-row md:items-center">
          {/* Specializations filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between md:w-[260px]">
                {selectedSpecializations.length > 0 
                  ? `${selectedSpecializations.length} selected`
                  : "Select specializations"}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full md:w-[260px] p-0" align="start">
              <div className="p-2">
                <Input
                  placeholder="Search specializations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                />
              </div>
              <ScrollArea className="h-[300px]">
                <div className="p-2">
                  {specializations.length > 0 ? (
                    filteredSpecializations.map((specialization) => (
                      <div
                        key={specialization}
                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                        onClick={() => toggleSpecialization(specialization)}
                      >
                        <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                          selectedSpecializations.includes(specialization)
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted"
                        }`}>
                          {selectedSpecializations.includes(specialization) && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                        <span>{specialization}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-muted-foreground">
                      No specializations available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Advanced Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="w-9 h-9 px-2">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-4" align="end">
              <DropdownMenuLabel>Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Rating Filter */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <Label>Minimum Rating</Label>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                    <span>{ratingRange[0]}.0+</span>
                  </div>
                </div>
                <Slider
                  value={ratingRange}
                  onValueChange={setRatingRange}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Experience Filter */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <Label>Years of Experience</Label>
                  <span>{experienceRange[0]}+ years</span>
                </div>
                <Slider
                  value={experienceRange}
                  onValueChange={setExperienceRange}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Verification Filter */}
              {/* <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={showVerifiedOnly}
                  onCheckedChange={setShowVerifiedOnly}
                />
                <Label htmlFor="verified">Show verified lawyers only</Label>
              </div> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filter Badges */}
        {(selectedSpecializations.length > 0 || ratingRange[0] > 0 || experienceRange[0] > 0 || showVerifiedOnly) && (
          <div className='flex flex-wrap gap-2'>
            {selectedSpecializations.map((spec) => (
              <Badge
                key={spec}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleSpecialization(spec)}
              >
                {spec} ×
              </Badge>
            ))}
            {ratingRange[0] > 0 && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setRatingRange([0])}
              >
                {ratingRange[0]}+ Stars ×
              </Badge>
            )}
            {experienceRange[0] > 0 && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setExperienceRange([0])}
              >
                {experienceRange[0]}+ Years Experience ×
              </Badge>
            )}
            {showVerifiedOnly && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setShowVerifiedOnly(false)}
              >
                Verified Only ×
              </Badge>
            )}
            <Badge
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setSelectedSpecializations([]);
                setRatingRange([0]);
                setExperienceRange([0]);
                setShowVerifiedOnly(false);
              }}
            >
              Clear all
            </Badge>
          </div>
        )}
      </div>

      {/* Lawyers grid */}
      <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3'>
        {filteredLawyers.map((lawyer) => (
          <LawyerCard lawyer={lawyer} key={lawyer.id} enableButtons={true} />
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className='container px-4 py-8 mx-auto'>
      <Skeleton className='w-48 h-8 mb-6' />
      <div className='flex gap-2 mb-6'>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className='w-20 h-8' />
        ))}
      </div>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {[...Array(6)].map((_, i) => (
          <Card key={i} className='p-6'>
            <div className='flex items-start gap-4'>
              <Skeleton className='w-12 h-12 rounded-full' />
              <div className='flex-1'>
                <Skeleton className='w-3/4 h-6 mb-2' />
                <div className='flex gap-2 mb-4'>
                  <Skeleton className='w-16 h-5' />
                  <Skeleton className='w-16 h-5' />
                </div>
                <Skeleton className='w-full h-4 mb-2' />
                <Skeleton className='w-2/3 h-4' />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default LawyersPage;
