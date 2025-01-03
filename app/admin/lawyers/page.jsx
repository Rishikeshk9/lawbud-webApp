'use client';
import * as React from 'react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Scale,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { mockLawyers } from '@/app/data/mockLawyers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function LawyersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationAction, setVerificationAction] = useState(null); // 'verify' or 'reject'
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);

  // Filter only human lawyers for the admin panel
  const humanLawyers = mockLawyers.filter((lawyer) => !lawyer.isAI);

  const filteredLawyers = humanLawyers.filter(
    (lawyer) =>
      (lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.barCouncilId.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus === 'all' || lawyer.status === selectedStatus)
  );

  const toggleRow = (lawyerId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(lawyerId)) {
      newExpandedRows.delete(lawyerId);
    } else {
      newExpandedRows.add(lawyerId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className='bg-green-100 text-green-800 hover:bg-green-200'>
            <CheckCircle className='w-3 h-3 mr-1' />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge
            variant='outline'
            className='text-yellow-600 border-yellow-300'
          >
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className='bg-red-100 text-red-800 hover:bg-red-200'>
            <XCircle className='w-3 h-3 mr-1' />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getDocumentStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge className='bg-green-100 text-green-800'>Verified</Badge>;
      case 'pending':
        return (
          <Badge variant='outline' className='text-yellow-600'>
            Pending
          </Badge>
        );
      case 'rejected':
        return <Badge className='bg-red-100 text-red-800'>Rejected</Badge>;
      default:
        return null;
    }
  };

  const handleVerificationAction = async (action) => {
    try {
      // Here you would make an API call to update the lawyer's status
      toast({
        title: 'Status Updated',
        description: `Lawyer has been ${action}ed successfully.`,
      });
      setShowVerificationDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

  const handleSuspendAccount = async () => {
    try {
      // Here you would make an API call to suspend the account
      toast({
        title: 'Account Suspended',
        description: 'The lawyer account has been suspended.',
      });
      setShowSuspendDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to suspend account.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className='p-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
        <h2 className='text-lg font-semibold'>Lawyers Management</h2>
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500' />
            <Input
              placeholder='Search lawyers...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-9'
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className='h-10 rounded-md border border-input bg-background px-3 py-2'
          >
            <option value='all'>All Status</option>
            <option value='verified'>Verified</option>
            <option value='pending'>Pending</option>
            <option value='rejected'>Rejected</option>
          </select>
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[30px]'></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Bar Council ID</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className='w-[70px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLawyers.map((lawyer) => (
              <React.Fragment key={lawyer.id}>
                <TableRow>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleRow(lawyer.id)}
                    >
                      {expandedRows.has(lawyer.id) ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : (
                        <ChevronDown className='h-4 w-4' />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className='font-medium'>{lawyer.name}</div>
                      <div className='text-sm text-gray-500'>
                        {lawyer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{lawyer.barCouncilId}</TableCell>
                  <TableCell>{lawyer.specialization}</TableCell>
                  <TableCell>{lawyer.experience}</TableCell>
                  <TableCell>{getStatusBadge(lawyer.status)}</TableCell>
                  <TableCell>
                    {new Date(lawyer.joinedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align='end'
                        className='bg-white border shadow-lg'
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedLawyer(lawyer);
                            setShowDetailsDialog(true);
                          }}
                          className='cursor-pointer hover:bg-gray-100'
                        >
                          View Details
                        </DropdownMenuItem>
                        {lawyer.status === 'pending' && (
                          <>
                            <DropdownMenuItem
                              className='text-green-600 cursor-pointer hover:bg-gray-100'
                              onClick={() => {
                                setSelectedLawyer(lawyer);
                                setVerificationAction('verify');
                                setShowVerificationDialog(true);
                              }}
                            >
                              Verify
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className='text-red-600 cursor-pointer hover:bg-gray-100'
                              onClick={() => {
                                setSelectedLawyer(lawyer);
                                setVerificationAction('reject');
                                setShowVerificationDialog(true);
                              }}
                            >
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          className='text-red-600 cursor-pointer hover:bg-gray-100'
                          onClick={() => {
                            setSelectedLawyer(lawyer);
                            setShowSuspendDialog(true);
                          }}
                        >
                          Suspend Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {expandedRows.has(lawyer.id) && (
                  <TableRow>
                    <TableCell colSpan={8} className='bg-gray-50'>
                      <div className='p-4'>
                        <h3 className='font-semibold mb-4'>
                          Uploaded Documents
                        </h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                          {lawyer.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className='flex items-center justify-between p-3 bg-white rounded-lg border'
                            >
                              <div className='flex items-center gap-3'>
                                <FileText className='h-5 w-5 text-gray-500' />
                                <div>
                                  <p className='font-medium'>{doc.name}</p>
                                  <p className='text-sm text-gray-500'>
                                    {new Date(
                                      doc.uploadDate
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className='flex items-center gap-2'>
                                {getDocumentStatusBadge(doc.status)}
                                <Button variant='ghost' size='icon'>
                                  <Download className='h-4 w-4' />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Lawyer Details Dialog */}
      <LawyerDetailsDialog
        lawyer={selectedLawyer}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        getStatusBadge={getStatusBadge}
        getDocumentStatusBadge={getDocumentStatusBadge}
      />

      {/* Verification Dialog */}
      <Dialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
      >
        <DialogContent className='bg-white'>
          <DialogHeader>
            <DialogTitle>
              {verificationAction === 'verify'
                ? 'Verify Lawyer'
                : 'Reject Application'}
            </DialogTitle>
          </DialogHeader>
          <div className='py-4'>
            <Alert>
              <AlertTitle>Are you sure?</AlertTitle>
              <AlertDescription>
                {verificationAction === 'verify'
                  ? 'This will approve the lawyers account and grant them access to the platform.'
                  : 'This will reject the lawyers application and notify them via email.'}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowVerificationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant={
                verificationAction === 'verify' ? 'default' : 'destructive'
              }
              onClick={() => handleVerificationAction(verificationAction)}
            >
              {verificationAction === 'verify' ? 'Verify' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Account Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className='bg-white'>
          <DialogHeader>
            <DialogTitle>Suspend Account</DialogTitle>
          </DialogHeader>
          <div className='py-4'>
            <Alert variant='destructive'>
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This will immediately suspend the lawyer's account and prevent
                them from accessing the platform. This action can be reversed
                later.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowSuspendDialog(false)}
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleSuspendAccount}>
              Suspend Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function LawyerDetailsDialog({
  lawyer,
  open,
  onOpenChange,
  getStatusBadge,
  getDocumentStatusBadge,
}) {
  if (!lawyer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl bg-white p-6'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold flex items-center gap-4'>
            <div className='flex items-center gap-4'>
              <Avatar className='h-12 w-12'>
                <AvatarFallback>{lawyer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                {lawyer.name}
                <div className='text-sm font-normal text-gray-500'>
                  {getStatusBadge(lawyer.status)}
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue='overview' className='mt-6'>
          <TabsList className='bg-gray-100 p-1'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='documents'>Documents</TabsTrigger>
            <TabsTrigger value='education'>Education</TabsTrigger>
            <TabsTrigger value='reviews'>Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='mt-6 space-y-8'>
            {/* Basic Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <Card className='p-4 space-y-4'>
                <h3 className='font-semibold text-lg'>Contact Information</h3>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <Mail className='h-4 w-4' />
                    <span>{lawyer.email}</span>
                  </div>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <Phone className='h-4 w-4' />
                    <span>{lawyer.phone}</span>
                  </div>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <MapPin className='h-4 w-4' />
                    <span>{lawyer.location}</span>
                  </div>
                </div>
              </Card>

              <Card className='p-4 space-y-4'>
                <h3 className='font-semibold text-lg'>Professional Details</h3>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <Scale className='h-4 w-4' />
                    <span>Bar Council ID: {lawyer.barCouncilId}</span>
                  </div>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <Briefcase className='h-4 w-4' />
                    <span>Experience: {lawyer.experience}</span>
                  </div>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <GraduationCap className='h-4 w-4' />
                    <span>Specialization: {lawyer.specialization}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* About Section */}
            <Card className='p-4 space-y-4'>
              <h3 className='font-semibold text-lg'>About</h3>
              <p className='text-gray-600'>{lawyer.about}</p>
            </Card>

            {/* Languages & Fees */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <Card className='p-4 space-y-4'>
                <h3 className='font-semibold text-lg'>Languages</h3>
                <div className='flex flex-wrap gap-2'>
                  {lawyer.languages.map((language) => (
                    <Badge key={language} variant='secondary'>
                      {language}
                    </Badge>
                  ))}
                </div>
              </Card>

              <Card className='p-4 space-y-4'>
                <h3 className='font-semibold text-lg'>Fees</h3>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Consultation</span>
                    <span className='font-medium'>
                      ₹{lawyer.fees.consultation}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Hourly Rate</span>
                    <span className='font-medium'>₹{lawyer.fees.hourly}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='documents' className='mt-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {lawyer.documents.map((doc) => (
                <Card key={doc.id} className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-gray-100 rounded'>
                        <FileText className='h-5 w-5 text-gray-600' />
                      </div>
                      <div>
                        <p className='font-medium'>{doc.name}</p>
                        <p className='text-sm text-gray-500'>
                          Uploaded on{' '}
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {getDocumentStatusBadge(doc.status)}
                      <Button variant='ghost' size='icon'>
                        <Download className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value='education' className='mt-6'>
            <div className='space-y-4'>
              {lawyer.education.map((edu, index) => (
                <Card key={index} className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-gray-100 rounded'>
                      <GraduationCap className='h-5 w-5 text-gray-600' />
                    </div>
                    <div>
                      <h4 className='font-semibold'>{edu.degree}</h4>
                      <p className='text-gray-600'>{edu.institution}</p>
                      <p className='text-sm text-gray-500'>Year: {edu.year}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value='reviews' className='mt-6'>
            <div className='space-y-4'>
              {lawyer.reviews.map((review) => (
                <Card key={review.id} className='p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='flex items-center'>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className='font-medium'>{review.rating}</span>
                  </div>
                  <p className='text-gray-600'>{review.comment}</p>
                  <p className='text-sm text-gray-500 mt-2'>
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
