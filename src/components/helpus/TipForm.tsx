
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { wantedIndividuals } from '@/data/wantedIndividuals';

const formSchema = z.object({
  description: z.string().min(10, 'Please provide at least 10 characters of description'),
  location: z.string().min(3, 'Please provide a valid location'),
  dateTime: z.string().min(1, 'Please select a date and time'),
  isConfident: z.boolean().default(false),
  contactInfo: z.string().optional(),
  stayAnonymous: z.boolean().default(false),
  urgencyLevel: z.enum(['low', 'medium', 'high']).default('medium'),
});

type FormValues = z.infer<typeof formSchema>;

const TipForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const criminalId = queryParams.get('id');
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [criminal, setCriminal] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      location: '',
      dateTime: new Date().toISOString().slice(0, 16),
      isConfident: false,
      contactInfo: '',
      stayAnonymous: false,
      urgencyLevel: 'medium',
    }
  });
  
  const stayAnonymous = form.watch('stayAnonymous');
  
  useEffect(() => {
    if (criminalId) {
      const found = wantedIndividuals.find(c => c.id === criminalId);
      if (found) {
        setCriminal(found);
      }
    }
  }, [criminalId]);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you might want to convert coordinates to an address using a geocoding service
          const locationString = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          setCurrentLocation(locationString);
          form.setValue('location', locationString);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Unable to get your current location. Please enter it manually.");
          setIsGettingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser. Please enter your location manually.");
      setIsGettingLocation(false);
    }
  };
  
  const onSubmit = (data: FormValues) => {
    // Here you would normally send this to your backend
    console.log('Form data:', data);
    console.log('Criminal ID:', criminalId);
    console.log('Photo file:', photoFile);
    
    // For demo purposes, we'll just show a success message
    toast.success("Report submitted successfully. Thank you for helping make our community safer.", {
      duration: 5000,
    });
    
    // Navigate back to the help us page
    setTimeout(() => {
      navigate('/help-us');
    }, 2000);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {criminal && (
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-12 w-12">
              <AvatarImage src={criminal.photoUrl} alt={criminal.name} />
              <AvatarFallback>{criminal.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{criminal.name}</h3>
              <p className="text-sm text-gray-500">Please provide as much detail as possible about your sighting</p>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description of Sighting</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe where and how you saw this person, what they were wearing, who they were with, etc."
                    className="resize-none h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <div className="flex">
                    <FormControl>
                      <Input 
                        placeholder="Where did you see this person?"
                        className="rounded-r-none flex-1"
                        {...field}
                      />
                    </FormControl>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="rounded-l-none border-l-0 bg-gray-50"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                    >
                      <MapPin className="h-4 w-4" />
                      {isGettingLocation ? 'Getting...' : 'Current'}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time of Sighting</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <Label>Photo Evidence (optional)</Label>
            <div className="flex items-start space-x-4 mt-2">
              <div className="flex-shrink-0">
                <div className={`h-32 w-32 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 ${photoPreview ? 'border-transparent' : 'border-gray-300'}`}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover rounded-md" />
                  ) : (
                    <Camera className="h-8 w-8 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="mb-2"
                  onChange={handlePhotoChange}
                />
                <p className="text-xs text-gray-500">Upload a clear photo if you have one. This can greatly assist law enforcement.</p>
              </div>
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="isConfident"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I am confident that the person I saw is the individual shown in the photo
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="urgencyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urgency Level</FormLabel>
                <FormControl>
                  <RadioGroup 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    className="flex space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="urgency-low" />
                      <Label htmlFor="urgency-low" className="font-normal">Low</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="urgency-medium" />
                      <Label htmlFor="urgency-medium" className="font-normal">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="urgency-high" />
                      <Label htmlFor="urgency-high" className="font-normal">High</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="stayAnonymous"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I wish to remain anonymous
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          {!stayAnonymous && (
            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Information (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Email or phone number where authorities can reach you if needed"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This information will only be used by law enforcement if they need additional details.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <Button type="submit" className="w-full bg-shield-blue">
            Submit Report
          </Button>
          <p className="text-xs text-center text-gray-500 mt-3">
            Your report will be sent securely to the appropriate law enforcement agency.
          </p>
        </div>
      </form>
    </Form>
  );
};

export default TipForm;
