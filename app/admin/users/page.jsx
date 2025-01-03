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
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Shield,
  Ban,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

// Mock users data - replace with actual API call
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    location: 'Mumbai, India',
    role: 'user',
    status: 'active',
    joinedDate: '2024-01-15',
    image: null,
    recentActivity: [
      {
        type: 'chat',
        description: 'Consulted with Lawyer Jane Smith',
        date: '2024-03-15',
      },
      {
        type: 'document',
        description: 'Uploaded case documents',
        date: '2024-03-14',
      },
    ],
  },
  // Add more mock users as needed
];

export default function UsersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  const filteredUsers = mockUsers.filter(
    (user) =>
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus === 'all' || user.status === selectedStatus)
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <Badge className='bg-green-100 text-green-800'>
            <Shield className='w-3 h-3 mr-1' />
            Active
          </Badge>
        );
      case 'blocked':
        return (
          <Badge className='bg-red-100 text-red-800'>
            <Ban className='w-3 h-3 mr-1' />
            Blocked
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleBlockUser = async () => {
    try {
      // Here you would make an API call to block the user
      toast({
        title: 'User Blocked',
        description: 'The user has been blocked successfully.',
      });
      setShowBlockDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to block user.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className='p-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
        <h2 className='text-lg font-semibold'>Users Management</h2>
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500' />
            <Input
              placeholder='Search users...'
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
            <option value='active'>Active</option>
            <option value='blocked'>Blocked</option>
          </select>
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className='w-[70px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={user.image} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className='font-medium'>{user.name}</div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell className='capitalize'>{user.role}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>
                  {new Date(user.joinedDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='bg-white'>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetailsDialog(true);
                        }}
                        className='cursor-pointer hover:bg-gray-100'
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='text-red-600 cursor-pointer hover:bg-gray-100'
                        onClick={() => {
                          setSelectedUser(user);
                          setShowBlockDialog(true);
                        }}
                      >
                        Block User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* User Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className='max-w-3xl bg-white p-6'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold flex items-center gap-4'>
              <div className='flex items-center gap-4'>
                <Avatar className='h-12 w-12'>
                  <AvatarImage src={selectedUser?.image} />
                  <AvatarFallback>
                    {selectedUser?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {selectedUser?.name}
                  <div className='text-sm font-normal text-gray-500'>
                    {getStatusBadge(selectedUser?.status)}
                  </div>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue='info' className='mt-6'>
            <TabsList className='bg-gray-100 p-1'>
              <TabsTrigger value='info'>Information</TabsTrigger>
              <TabsTrigger value='activity'>Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value='info' className='mt-6 space-y-6'>
              <Card className='p-4 space-y-4'>
                <h3 className='font-semibold text-lg'>Contact Information</h3>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <Mail className='h-4 w-4' />
                    <span>{selectedUser?.email}</span>
                  </div>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <Phone className='h-4 w-4' />
                    <span>{selectedUser?.phone}</span>
                  </div>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <MapPin className='h-4 w-4' />
                    <span>{selectedUser?.location}</span>
                  </div>
                </div>
              </Card>

              <Card className='p-4 space-y-4'>
                <h3 className='font-semibold text-lg'>Account Details</h3>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <User className='h-4 w-4' />
                    <span>Role: {selectedUser?.role}</span>
                  </div>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <Calendar className='h-4 w-4' />
                    <span>
                      Joined:{' '}
                      {new Date(selectedUser?.joinedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value='activity' className='mt-6'>
              <div className='space-y-4'>
                {selectedUser?.recentActivity.map((activity, index) => (
                  <Card key={index} className='p-4'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <p className='font-medium'>{activity.description}</p>
                        <p className='text-sm text-gray-500'>
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant='outline' className='capitalize'>
                        {activity.type}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Block User Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className='bg-white'>
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
          </DialogHeader>
          <div className='py-4'>
            <Alert variant='destructive'>
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This will prevent the user from accessing the platform. Are you
                sure you want to block this user?
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleBlockUser}>
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
