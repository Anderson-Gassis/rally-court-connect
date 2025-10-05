import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, UserPlus, Check, X, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import * as friendsService from '@/services/friendsService';
import { Link } from 'react-router-dom';

export function FriendsManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsService.getFriendsList
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: friendsService.getPendingRequests
  });

  const sendRequestMutation = useMutation({
    mutationFn: friendsService.sendFriendRequest,
    onSuccess: (data: any) => {
      if (data?.message) {
        toast.success(data.message);
      } else {
        toast.success('Solicitação de amizade enviada!');
      }
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      setSearchResults([]);
      setSearchTerm('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao enviar solicitação');
    }
  });

  const respondRequestMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'accepted' | 'rejected' }) =>
      friendsService.respondToFriendRequest(id, status),
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'accepted'
          ? 'Solicitação aceita! Vocês agora são amigos.'
          : 'Solicitação rejeitada'
      );
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao responder solicitação');
    }
  });

  const removeFriendMutation = useMutation({
    mutationFn: friendsService.removeFriend,
    onSuccess: () => {
      toast.success('Amizade removida com sucesso');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover amizade');
    }
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const results = await friendsService.searchUsers(searchTerm);
      setSearchResults(results);
    } catch (error) {
      toast.error('Erro ao buscar usuários');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">
            Meus Amigos ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Solicitações ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4 mt-6">
          {friends.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Você ainda não tem amigos. Busque e adicione pessoas!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {friends.map((friendship: any) => (
                <Card key={friendship.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={friendship.friend?.avatar_url} />
                          <AvatarFallback>
                            {friendship.friend?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{friendship.friend?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {friendship.friend?.email}
                          </p>
                          {friendship.friend?.skill_level && (
                            <Badge variant="outline" className="mt-1">
                              {friendship.friend.skill_level}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/players/${friendship.friend?.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Perfil
                          </Button>
                        </Link>
                        <Link to="/player/dashboard?tab=messages">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFriendMutation.mutate(friendship.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4 mt-6">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Nenhuma solicitação pendente
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request: any) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={request.sender?.avatar_url} />
                          <AvatarFallback>
                            {request.sender?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.sender?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.sender?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            respondRequestMutation.mutate({
                              id: request.id,
                              status: 'accepted'
                            })
                          }
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Aceitar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            respondRequestMutation.mutate({
                              id: request.id,
                              status: 'rejected'
                            })
                          }
                        >
                          <X className="h-4 w-4 mr-2" />
                          Recusar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="search" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Usuários</CardTitle>
              <CardDescription>
                Encontre pessoas pelo nome ou email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-6 space-y-4">
                  {searchResults.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => sendRequestMutation.mutate(user.user_id)}
                        disabled={sendRequestMutation.isPending}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}